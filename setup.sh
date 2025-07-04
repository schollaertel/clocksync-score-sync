#!/bin/bash
# Setup script to install project dependencies.
# This ensures linting and tests run without preinstalled Node modules.

set -euo pipefail

npm install
