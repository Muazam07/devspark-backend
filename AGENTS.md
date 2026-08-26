## Code Formatting

Always follow the formatting rules defined in the project's `.prettierrc` file. Before generating, modifying, or refactoring code, ensure that all code adheres to the Prettier configuration in the repository. Do not use personal or default formatting preferences when a `.prettierrc` file is present.


## File Size and Splitting

If a file exceeds **750 lines of code**, split it into meaningful chunks based on the component's logic and responsibilities.

- Keep the split minimal — generally **1 to 2 additional chunks maximum**.

## User-Friendly Errors

Always ensure that error messages shown to users are clear, concise, and user-friendly. Do not expose technical details, stack traces, API errors, or internal implementation details to the user.
