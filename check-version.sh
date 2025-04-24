if git diff --name-only | grep -q package.json; then
    if ! git diff package.json | grep '"version":' | grep -q '+'; then
        echo
        echo "🔔 Consider bumping the version with 'bv -p|-m|-M'"
    fi
else
    echo
    echo "🔔 Consider bumping the version with 'bv -p|-m|-M'"
fi
echo
