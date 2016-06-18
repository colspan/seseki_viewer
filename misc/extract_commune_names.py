#!/usr/bin/python
# -*- coding: utf-8 -*-

import sys
import json

if __name__ == "__main__":

    filename = sys.argv[1]

    with open(filename,"r") as f:
        data = json.load(f)
        #print json.dumps(data, sort_keys=True, indent=4)

    fieldname = "kanto"
    property_columns = ["N03_001", "N03_002", "N03_003", "N03_004", "N03_005", "N03_006", "N03_007"]
    print ",".join(property_columns)
    for d in data["objects"][fieldname]["geometries"]:
        extracted = []
        for x in property_columns:
            try:
                extracted.append((d["properties"][x]).encode('utf-8'))
            except:
                extracted.append("")
        print ",".join(extracted)
