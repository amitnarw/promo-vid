#!/usr/bin/env bash
# capture/shoot.sh — shoot the film's takes one after another, then freeze each.
# Every take is a plain-English request to headless Claude Code driving web-mcp.
#   bash capture/shoot.sh [take-id ...]   (no args = all)
cd "$(dirname "$0")/.."

declare -A PROMPT=(
  [checkout-01]="Go to saucedemo.com and test the checkout like a customer would: log in as standard_user with the password secret_sauce, add the Sauce Labs Backpack to the cart, check out with any test name and postcode, and tell me whether the order goes through."
  [prices-01]="Go to books.toscrape.com and tell me the five cheapest books on the first page, with their prices."
  [stats-01]="How popular is the @amitnarw/web-mcp package? Check its weekly downloads on npmjs.com and its stars on its GitHub page."
  [status-01]="Check githubstatus.com and tell me whether all GitHub services are working normally right now."
  [form-01]="Go to https://www.selenium.dev/selenium/web/web-form.html, fill in the form with some sample data, and submit it."
)
ORDER=(checkout-01 prices-01 stats-01 form-01)
[ $# -gt 0 ] && ORDER=("$@")

for id in "${ORDER[@]}"; do
  if [ -d "takes/$id" ]; then echo "== $id exists, skipping"; continue; fi
  echo "== $id: ${PROMPT[$id]}"
  timeout 900 npx tsx capture/take.ts --id "$id" --prompt "${PROMPT[$id]}" 2>&1 | grep -E "result:|done:|Error|failed" | cut -c1-400
  npx tsx capture/freeze.ts "$id" 2>&1 | tail -2
done
echo "== all takes done"
