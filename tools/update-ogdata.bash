#!/usr/bin/env bash
set -euxo pipefail

YAML_PATH='data/ogcard.yaml'

retrieve_ogp() {
    local url="$1"
    local contents=$(curl -H 'User-Agent: OGP collector at www.kofuk.org (https://github.com/kofuk/www.kofuk.org)' -- "${url}")

    local title=$(pup 'meta[property=og:title] attr{content}' <<<$contents)
    local description=$(pup 'meta[property=og:description] attr{content}' <<<$contents | head -1 | sed "s/'/\\\\'/g")

    cat <<EOF
'$url':
  title: '${title:-$url}'
  description: '$description'
EOF
}

if grep -Po '\{\{\<(  +ogcard | ogcard  +)"[^"]+" \>\}\}' -r content; then
    echo 'Suspicious tag found' >&2
    exit 1
fi

refs=$(grep -hPo '(?<=\{\{\< ogcard ")[^"]+(?=" +\>\}\})' -r content | sort -u)
yaml_data=$(grep -Po "(?<=^')[^']+(?=':$)" "${YAML_PATH}" | sort -u)

cp "${YAML_PATH}"{,.new}

for url in $(comm -2 -3 <(cat <<<$refs) <(cat <<<$yaml_data)); do
    retrieve_ogp "$url" >>"${YAML_PATH}.new"
done

cat >"${YAML_PATH}.urls" <<<$refs

cat "${YAML_PATH}.new" | sed -z 's/\n  /@@@  /g' | grep -Ff "${YAML_PATH}.urls" | sort | sed 's/@@@/\n/g' >"${YAML_PATH}"
rm "${YAML_PATH}."{new,urls}
