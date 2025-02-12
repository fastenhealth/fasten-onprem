{
  description = "Fasten development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
          config = {
            allowUnfreePredicate = pkg: builtins.elem (nixpkgs.lib.getName pkg) [
              "google-chrome"
            ];
          };
        };
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            # Frontend dependencies
            nodejs-18_x
            (yarn.override { nodejs = nodejs-18_x; })
            (pkgs.writeShellScriptBin "ng" ''
              ${nodejs-18_x}/bin/npx @angular/cli@14.1.3 "$@"
            '')

            # Backend dependencies
            go_1_22
            
            # Docker
            docker
            docker-compose

            # Chrome for frontend tests
            google-chrome

            # Go specific tools
            (pkgs.writeShellScriptBin "tygo" ''
              ${go_1_22}/bin/go install github.com/gzuidhof/tygo@latest
              ${go_1_22}/bin/go run github.com/gzuidhof/tygo "$@"
            '')
          ];

          shellHook = ''
            echo "Fasten development environment loaded!"
            echo "Node version: $(node --version)"
            echo "Yarn version: $(yarn --version)"
            echo "Go version: $(go version)"
            echo "Docker version: $(docker --version)"
          '';
        };
      }
    );
}
