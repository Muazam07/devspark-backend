## Code Formatting

Always follow the formatting rules defined in the project's `.prettierrc` file. Before generating, modifying, or refactoring code, ensure that all code adheres to the Prettier configuration in the repository. Do not use personal or default formatting preferences when a `.prettierrc` file is present.


## File Size and Splitting

If a file exceeds **750 lines of code**, split it into meaningful chunks based on the component's logic and responsibilities.

- Keep the split minimal — generally **1 to 2 additional chunks maximum**.

## User-Friendly Errors

Always ensure that error messages shown to users are clear, concise, and user-friendly. Do not expose technical details, stack traces, API errors, or internal implementation details to the user.

## Route and Controller Organization

Always verify that every API is placed in the correct position in its route file. Define static or collection routes before dynamic parameter routes so that dynamic routes do not intercept them.

For example:

```js
router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUser);
```

Keep the corresponding controller functions in the same logical order as their routes. After adding, removing, or reorganizing APIs, compare `userRoutes` with `userController` and confirm that every route has its corresponding controller function, with both files following the same order.
