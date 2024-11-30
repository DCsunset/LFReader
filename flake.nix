{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
    fenix = {
      url = "github:nix-community/fenix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = inputs@{ nixpkgs, flake-parts, fenix, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      systems = [
        "x86_64-linux"
        "aarch64-linux"
      ];

      perSystem = { self', system, pkgs, ... }: let
        # specify versions to prevent downloading too many files
        buildToolsVersion = "34.0.0";
        androidPkgs = (pkgs.androidenv.composeAndroidPackages {
          # should be same with frontend/src-tauri/gen/android/app/build.gradle.kts
          platformVersions = [ "34" ];
          buildToolsVersions = [ buildToolsVersion ];
          abiVersions = [ "arm64-v8a" ];
          includeNDK = true;
        });

        deps = with pkgs; [
          (python3.withPackages (p: with p; [
            aiohttp
            beautifulsoup4
            feedparser
            fastapi
            uvicorn
            pydantic
            python-lsp-server
          ]))

          # For Tauri
          pkg-config
          gobject-introspection
          cargo-tauri
          nodejs

          # Rust toolchain (targets should match abiVersions in composeAndroidPackages)
          (with fenix.packages.${system};
            combine [
              minimal.rustc
              minimal.cargo
              targets.aarch64-linux-android.latest.rust-std
              # targets.armv7-linux-androideabi.latest.rust-std
              # targets.i686-linux-android.latest.rust-std
              # targets.x86_64-linux-android.latest.rust-std
            ])

          # Tauri Android
          jdk
          androidPkgs.androidsdk
        ];
        buildDeps = with pkgs; [
          at-spi2-atk
          atkmm
          cairo
          gdk-pixbuf
          glib
          gtk3
          harfbuzz
          librsvg
          libsoup_3
          pango
          webkitgtk_4_1
          openssl
        ];

        createFlakeApp = name: text: {
          type = "app";
          program = pkgs.writeShellApplication {
            runtimeInputs = deps;
            inherit name text;
          };
        };
      in {
        _module.args.pkgs = import nixpkgs {
          inherit system;
          config = {
            android_sdk.accept_license = true;
            allowUnfree = true;
          };
        };

        devShells = {
          default = pkgs.mkShell {
            # packages = deps;
            # inputsFrom = buildDeps;
            nativeBuildInputs = deps;
            buildInputs = buildDeps;

            ANDROID_HOME = "${androidPkgs.androidsdk}/libexec/android-sdk";
            NDK_HOME = "${androidPkgs.androidsdk}/libexec/android-sdk/ndk/${androidPkgs.ndk-bundle.version}";
            # Fix dynamic linking error (Credits to https://gist.github.com/janKeli/1a0d66b7f059387e44ba232b79af7450)
            GRADLE_OPTS = "-Dorg.gradle.project.android.aapt2FromMavenOverride=${androidPkgs.androidsdk}/libexec/android-sdk/build-tools/34.0.0/aapt2";

            shellHook = ''
              export PATH="$PATH:$ANDROID_HOME/build-tools/${buildToolsVersion}"
            '';
          };
        };
        apps = {
          # dev server
          # note: reload doesn't work for some reason
          backend-dev = createFlakeApp "backend-dev" ''
            cd backend
            uvicorn lfreader_server.app:app --reload --port 3000 --log-level debug --timeout-graceful-shutdown 5
          '';

          # prod server
          backend-prod = createFlakeApp "backend-prod" ''
            cd backend
            uvicorn lfreader_server.app:app --host 0.0.0.0 --port 3000
          '';
        };
      };
    };
}
