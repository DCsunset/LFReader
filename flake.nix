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
        # common dependencies
        deps = with pkgs; [
          (python3.withPackages(p: with p; [
            aiohttp
            beautifulsoup4
            feedparser
            fastapi
            uvicorn
          ]))
        ];

        createFlakeApp = name: text: {
          type = "app";
          program = pkgs.writeShellApplication {
            runtimeInputs = deps;
            inherit name text;
          };
        };
      in {
        devShells = {
          default = pkgs.mkShell {
            packages = deps;
          };
        };
        apps = {
          # dev server
          backend-dev = createFlakeApp "backend-dev" ''
            cd backend
            python app.py --reload --port 3000
          '';

          # prod server
          backend-prod = createFlakeApp "backend-prod" ''
            cd backend
            python app.py --host 0.0.0.0 --port 3000
          '';
        };
      };
    };
}
