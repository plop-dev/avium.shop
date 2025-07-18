# 🔁 Steps

1. Switch to main

    Open the Source Control panel or use the branch switcher at the bottom-left of VSCode.

    Select main and wait for it to load.

2. Pull latest main

    Click the … in the Source Control tab > Pull, or use Ctrl+Shift+P → Git: Pull.

3. Switch to dev

    Again, use the branch switcher and switch to dev.

4. Open VSCode terminal

    Press Ctrl+` (backtick) or go to View > Terminal.

5. Run the reset command in terminal:

    `git reset --hard main`

    > This forcefully sets your dev branch to match the state of main.

6. Push the changes to remote (force push):

    `git push --force`

    > This updates the remote dev to match main, overriding any prior commits.
