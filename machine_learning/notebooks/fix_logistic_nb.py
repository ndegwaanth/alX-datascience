import json
from pathlib import Path

p = Path(r"c:\Users\Anthony\Pictures\alX-datascience\machine_learning\notebooks\week7\Logistic_regression_code_challenge_student_version.ipynb")
nb = json.loads(p.read_text(encoding="utf-8"))
updated = False
for cell in nb["cells"]:
    src = "".join(cell.get("source", []))
    if "def scores" in src:
        src = src.replace(
            "    returns: tuple, (accuracy, recall, precision, f1_score)\n",
            "    returns: tuple, (accuracy, precision, recall, f1_score)\n",
        )
        src = src.replace(
            "    return (accuracy, recall, precision, f1)\n",
            "    return (accuracy, precision, recall, f1)\n",
        )
        cell["source"] = src.splitlines(keepends=True)
        updated = True
        break
if not updated:
    raise SystemExit("No matching cell found")
p.write_text(json.dumps(nb, indent=1, ensure_ascii=False), encoding="utf-8")
print("Patched notebook")
