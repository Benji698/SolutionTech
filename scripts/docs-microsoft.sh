#!/usr/bin/env bash
# Télécharge (sans historique) les articles officiels de dépannage Microsoft
# (dépôt public MicrosoftDocs/SupportArticles-docs, source de learn.microsoft.com/troubleshoot)
# dans .cache/msdocs/ (non versionné). Utile quand learn.microsoft.com n'est pas lisible directement.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p .cache
if [ ! -d .cache/msdocs ]; then
  git clone --depth 1 --filter=blob:none --sparse https://github.com/MicrosoftDocs/SupportArticles-docs .cache/msdocs
fi
cd .cache/msdocs
git sparse-checkout set --no-cone '/Exchange/**/*.md' '/Microsoft365/**/*.md' '/Office/**/*.md' '/Outlook/**/*.md' \
  '/SharePoint/**/*.md' '/Teams/**/*.md' '/support/entra/**/*.md' '/support/mem/**/*.md' \
  '/support/windows-client/**/*.md' '/support/windows-server/**/*.md'
echo "Documentation disponible dans .cache/msdocs/"
