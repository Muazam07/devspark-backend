## Code Formatting

Always follow the formatting rules defined in the project's `.prettierrc` file. Before generating, modifying, or refactoring code, ensure that all code adheres to the Prettier configuration in the repository. Do not use personal or default formatting preferences when a `.prettierrc` file is present.

After adding or modifying code, automatically run `npm run format` before completing the task. The user should not need to request formatting separately. If the user explicitly instructs you not to run commands, respect that instruction and ensure the changes manually follow `.prettierrc` instead.


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


## Schema and Model Field Ordering

Always organize schema/model fields in a logical, industry-standard order. Put `id` first, then group related fields by purpose, such as profile, authentication, authorization, verification, and security. Keep the ordering consistent across all models.

## Inactive User Access

Inactive users must not be able to access or use any API across the entire system.

## Project Structure

Keep enums, models, controllers, and routes in separate folders, with each enum and controller in its own file.
