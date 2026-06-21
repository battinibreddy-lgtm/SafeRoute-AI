# Contributing

Thank you for contributing to SafeRoute AI.

## Workflow

1. Fork the repository.
2. Install the development dependencies:

   ```bash
   python -m pip install -r requirements-dev.txt
   npm --prefix frontend ci
   pre-commit install --install-hooks
   ```

3. Create a feature branch.
4. Make your changes.
5. Test locally.
6. Commit with meaningful messages.
7. Submit a merge request.

The pre-commit hook runs formatting, linting, type checking, and secret checks.
The pre-push hook runs dead-code checks, unit tests, security scans, dependency
audits, and dependency license compliance checks. Run either gate manually with:

```bash
pre-commit run --all-files
pre-commit run --all-files --hook-stage pre-push
```

## Coding Standards

* Use descriptive variable names.
* Keep components modular.
* Follow existing project structure.
* Add comments where necessary.

## Reporting Issues

Create an issue with:

* Steps to reproduce
* Expected behavior
* Actual behavior
* Screenshots (if applicable)
