# TransTable

Portable online i18n editor with CSV.

Online demo: https://transtable.pages.dev/?csv=examples/ex1.csv

Developer Manual: https://pub-714f8d634e8f451d9f2fe91a4debfa23.r2.dev/keep/transtable/TransTable-DevDoc.pdf--8d21a818702fb75925e727511e34cc98.pdf


## Workflows

### Developer Setup Workflow

- Clone repo
- Put CSV files in `/files`.
- Run `./make.sh www`.
- Deploy `www` subdir to somewhere on the web (e.g. Cloudflare Pages).
- Share the `?csv=path/to/file.csv` URL to contributors.

### Contributor Workflow

- Visit the webpage.
- Edit cell contents.
- Send the generated diff list to the developer.

### Developer Routine Workflow

- Collect suggestions.
- Paste into the text area below.
- Click the "Export Full CSV" button.
- Copy the exported CSV to the local editor.




## Copyright

Copyright (c) 2024 Nekostein, an unincorporated game development team consisting of Neruthes and MIAO_OAIM.

Published with GNU GPL 2.0.
