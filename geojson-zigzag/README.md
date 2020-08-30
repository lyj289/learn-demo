# ZigZag in GeoJSON, to reduce the data size

There are many coordinate numbers in the GeoJSON, with ZigZag, it is possible to compress the data size of GeoJSON file.

Also, ZigZag is used in the Google Protobuf, to reduce the size of message transmitted between client and servers.

Run

```
node index.js
```

## Data

- data.json , origin demo data

```
[104.5458984375, 30.581179257386985 ], [105.66650390625, 27.605670826465445 ], [111.533203125, 26.37218544169559 ], [113.5986328125, 29.53522956294847 ], [113.115234375, 32.84267363195431 ], [107.490234375, 32.76880048488168 ], [104.5458984375, 30.581179257386985 ]
```

- encodeOuput.json, output data of encoding the data.json, the compression ratio is about 50%

```
["@@स᠍⼮ਝ჆ᦎН᪴ⴿÕ៍ᆿ"]
```

- decodeOuput.json, output data of decoding the encodeOutput.json

```
[104.5458984375,30.58203125],[105.6669921875,27.6064453125],[111.533203125,26.373046875],[113.5986328125,29.5361328125],[113.115234375,32.8427734375],[107.490234375,32.76953125],[104.5458984375,30.58203125]
```

But, there are some little coordinates difference between the origin demo data and the decode output json
