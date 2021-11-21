
(Select-String -Pattern 'js\/.*\.js' *.html) | ForEach-Object -Process {get-content $_.Matches.Value} | clip
