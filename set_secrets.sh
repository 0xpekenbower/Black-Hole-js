keys=$(cat .secrets | tr '\n' ' ')
echo "Setting secrets: $keys"
for key in $keys; do
  value=$(grep "^$key=" .env | cut -d '=' -f 2-)
  gh secret set "$key" --body "$value"
done