# Malita's Place Boutique Shop Demo

Static prototype for an antique/custom furniture boutique with inventory-aware shop behavior.

## Preview

Run a local server from this folder:

```powershell
python -m http.server 4180 --bind 127.0.0.1
```

Open:

```text
http://127.0.0.1:4180/
```

## Included Behavior

- Public shop only shows published listings.
- Sold-out listings remain visible but cannot be added to cart.
- Demo checkout subtracts from inventory and marks sold-out items unavailable.
- Owner view saves new inventory as a draft first.
- Adding inventory requires a picture and shows a preview before saving.
- Owner can publish, move back to draft, add stock, mark sold, or delete.
- Items can be marked restockable or one-off.
- Demo data persists in browser local storage and can be reset.
