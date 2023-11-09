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
            uvicorn app:app --reload --port 3000 --root-path /api
          '';

          # prod server
          backend-prod = createFlakeApp "backend-prod" ''
            cd backend
            uvicorn app:app --host 0.0.0.0 --port 3000 --root-path /api
          '';
        };
      };
    };
}
