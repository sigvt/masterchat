# pip install genson

from genson import SchemaBuilder
import json
import sys
from os.path import basename

input = sys.argv[1]
jsons = [json.loads(x) for x in open(input, 'r').readlines()]
print(len(jsons))

builder = SchemaBuilder()
builder.add_schema({"type": "object", "properties": {}})
for obj in jsons:
    builder.add_object(obj)

with open(f'{basename(input)}.schema.json', 'w') as f:
    f.write(json.dumps(builder.to_schema()))