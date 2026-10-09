import json, pathlib, struct, zlib

root = pathlib.Path("/home/omixia/projects/fixauto")
items = [(root / "public/images/case-sample-sedan.png", root / ".impeccable/case-sedan-provenance.json")]
items += [(p, pathlib.Path(str(p) + ".json")) for p in (root / ".impeccable/mocks").glob("case-option-*.png")]
for image, sidecar in items:
    prompt = json.loads(sidecar.read_text(encoding="utf-8-sig"))["prompt"]
    data = image.read_bytes()
    assert data[:8] == b"\x89PNG\r\n\x1a\n"
    offset = 8
    while data[offset + 4:offset + 8] != b"IEND":
        offset += struct.unpack(">I", data[offset:offset + 4])[0] + 12
    payload = b"Description\0\0\0\0\0" + prompt.encode("utf-8")
    chunk = b"iTXt" + payload
    encoded = struct.pack(">I", len(payload)) + chunk + struct.pack(">I", zlib.crc32(chunk) & 0xffffffff)
    image.write_bytes(data[:offset] + encoded + data[offset:])
    assert prompt.encode("utf-8") in image.read_bytes()
    print(image.name + ": prompt embedded, pixels unchanged")

