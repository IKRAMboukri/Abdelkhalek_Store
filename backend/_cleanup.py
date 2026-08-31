import sqlite3
c = sqlite3.connect("furniture_store.db")
# Delete business/demo tables. Keep users and store_settings (system config).
tables = ["credit_payments","credits","payments","sale_items","sales",
          "category_options","subcategories","products","categories",
          "customers","notifications"]
for t in tables:
    try:
        c.execute(f"DELETE FROM {t}")
    except Exception as e:
        print(f"{t}: ERROR {e}")
c.commit()
print("=== counts after cleanup ===")
for t in tables + ["users","store_settings"]:
    try:
        print(f"{t}: {c.execute(f'SELECT COUNT(*) FROM {t}').fetchone()[0]}")
    except Exception as e:
        print(f"{t}: ERROR {e}")
c.close()
