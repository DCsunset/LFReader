{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
  };

  outputs = inputs@{ nixpkgs, flake-parts, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      systems = [
        "x86_64-linux"
        "aarch64-linux"
      ];

      perSystem = { self', system, pkgs, ... }: let
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
        ];
        buildDeps = [ ];

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
          };
        };
        apps = {
          # dev server
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
