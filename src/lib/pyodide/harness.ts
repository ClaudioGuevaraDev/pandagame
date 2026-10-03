/**
 * Arnés Python compartido por el Web Worker del navegador y por el script de
 * validación de retos (scripts/validate.mts). Define `_pg_run` y `_pg_test`,
 * que devuelven JSON.
 */
export const HARNESS = String.raw`
import sys, io, json, ast, traceback
import numpy as np
import pandas as pd

pd.set_option("display.width", 120)
pd.set_option("display.max_columns", 30)

_PG_FILE = "<tu código>"
_PG_MAX_OUT = 20000


def check_frame(actual, expected, **kwargs):
    assert isinstance(actual, pd.DataFrame), f"Se esperaba un DataFrame y se obtuvo {type(actual).__name__}"
    kwargs.setdefault("check_dtype", False)
    kwargs.setdefault("check_index_type", False)
    kwargs.setdefault("check_column_type", False)
    try:
        pd.testing.assert_frame_equal(actual, expected, **kwargs)
    except AssertionError as e:
        raise AssertionError(
            "El DataFrame no coincide con el esperado.\n" + str(e)
            + "\n\nEsperado:\n" + expected.head(10).to_string()
            + "\n\nObtenido:\n" + actual.head(10).to_string()
        ) from None


def check_series(actual, expected, **kwargs):
    assert isinstance(actual, pd.Series), f"Se esperaba una Series y se obtuvo {type(actual).__name__}"
    kwargs.setdefault("check_dtype", False)
    kwargs.setdefault("check_index_type", False)
    try:
        pd.testing.assert_series_equal(actual, expected, **kwargs)
    except AssertionError as e:
        raise AssertionError(
            "La Series no coincide con la esperada.\n" + str(e)
            + "\n\nEsperado:\n" + expected.head(10).to_string()
            + "\n\nObtenido:\n" + actual.head(10).to_string()
        ) from None


def _pg_format_error(exc, code):
    lines = code.splitlines()
    frames = [f for f in traceback.extract_tb(exc.__traceback__) if f.filename == _PG_FILE]
    if isinstance(exc, SyntaxError) and exc.filename == _PG_FILE:
        where = f"Línea {exc.lineno}: {(exc.text or '').rstrip()}\n" if exc.lineno else ""
        return where + f"SyntaxError: {exc.msg}"
    out = ""
    if frames:
        f = frames[-1]
        src = lines[f.lineno - 1].strip() if f.lineno and f.lineno <= len(lines) else ""
        out = f"Línea {f.lineno}: {src}\n"
    return out + "".join(traceback.format_exception_only(type(exc), exc)).strip()


def _pg_display(value):
    if isinstance(value, pd.Series):
        value = value.to_frame()
    if isinstance(value, pd.DataFrame):
        return value.to_html(max_rows=60, max_cols=30, border=0, classes="df")
    return None


def _pg_exec_user(code, ns):
    """Ejecuta como un notebook: si la última línea es una expresión, devuelve su valor."""
    tree = ast.parse(code, _PG_FILE)
    last = None
    if tree.body and isinstance(tree.body[-1], ast.Expr):
        last = ast.Expression(tree.body.pop().value)
    exec(compile(tree, _PG_FILE, "exec"), ns)
    if last is not None:
        return eval(compile(last, _PG_FILE, "eval"), ns)
    return None


def _pg_run(setup, code):
    ns = {"__name__": "__main__"}
    buf = io.StringIO()
    old = sys.stdout, sys.stderr
    sys.stdout = sys.stderr = buf
    res = {"ok": True, "stdout": "", "error": None, "html": None, "repr": None}
    try:
        exec(setup, ns)
        value = _pg_exec_user(code, ns)
        if value is not None:
            html = _pg_display(value)
            if html is not None:
                res["html"] = html
            else:
                res["repr"] = repr(value)[:_PG_MAX_OUT]
    except BaseException as e:
        res["ok"] = False
        res["error"] = _pg_format_error(e, code)
    finally:
        sys.stdout, sys.stderr = old
    res["stdout"] = buf.getvalue()[:_PG_MAX_OUT]
    return json.dumps(res)


def _pg_test(setup, code, tests_json):
    tests = json.loads(tests_json)
    ns = {"__name__": "__main__"}
    buf = io.StringIO()
    old = sys.stdout, sys.stderr
    sys.stdout = sys.stderr = buf
    results = []
    error = None
    try:
        exec(setup, ns)
        _pg_exec_user(code, ns)
    except BaseException as e:
        error = _pg_format_error(e, code)
    if error is None:
        for t in tests:
            tns = dict(ns)
            tns.update({"pd": pd, "np": np, "check_frame": check_frame, "check_series": check_series})
            try:
                exec(compile(t["code"], "<test>", "exec"), tns)
                results.append({"name": t["name"], "passed": True, "message": None})
            except AssertionError as e:
                msg = str(e) or "La comprobación falló."
                results.append({"name": t["name"], "passed": False, "message": msg[:4000]})
            except BaseException as e:
                where = "tu código" if any(f.filename == _PG_FILE for f in traceback.extract_tb(e.__traceback__)) else "el test"
                msg = "".join(traceback.format_exception_only(type(e), e)).strip()
                results.append({"name": t["name"], "passed": False, "message": f"Error al ejecutar ({where}): {msg}"[:4000]})
    else:
        for t in tests:
            results.append({"name": t["name"], "passed": False, "message": "Tu código lanzó un error antes de poder ejecutar los tests."})
    sys.stdout, sys.stderr = old
    return json.dumps({"error": error, "results": results, "stdout": buf.getvalue()[:_PG_MAX_OUT]})
`;
