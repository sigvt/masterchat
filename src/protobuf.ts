/**
```
0a = 00001 010 field=1 wire=2 length-delimited
29 = 41bytes
	2a = 00101 010 field=5 wire=2
	27 = 39bytes
		0a = field=1 wire=2
		18 = 24bytes
			<omitted> (channel id)
		12 = 00010 010 field=2 wire=2
		0b = 11bytes
			<omitted> (video id)
		10 = 00010 000 field=2 wire=0
			02 = decimal=2 (unknown enum)
		18 = 00011 000 field=3 wire=0
			04 = decimal=4 (unknown enum)
```
 */
export function generateSendMessageParams(channelId: string, videoId: string) {
  return Buffer.from([
    ...lenDelim(
      1,
      lenDelim(
        5,
        Buffer.from([
          ...lenDelim(1, Buffer.from(channelId)),
          ...lenDelim(2, Buffer.from(videoId)),
        ])
      )
    ),
    ...variant(2, 2),
    ...variant(3, 4),
  ]);
}

function lenDelim(fieldId: number, payload: Buffer) {
  const bLen = payload.byteLength;
  return Buffer.from([(fieldId << 3) | 2, bLen, ...payload]);
}

// TODO: support for number larger than 7 bits
function variant(fieldId: number, payload: number) {
  return Buffer.from([(fieldId << 3) | 0, payload]);
}
