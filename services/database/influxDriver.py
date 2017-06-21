#!/usr/bin/python
import argparse , ast , json

from influxdb import InfluxDBClient

def write(client,data):
    result = client.write_points(data)
    print "{\"status\":\""+str(result)+"\"}"

def query(client,query):
    result = client.query(query)
    print json.dumps(result.raw)#, indent=4, sort_keys=True)

def createDB(client,dbname):
    result = client.create_database(dbname)

def main(args):
    client = InfluxDBClient(host=args.host, port=args.port, database = args.db)
    if args.write:
        list_data = []
        data = ast.literal_eval(args.write)
        list_data.append(data)
        write(client,list_data)
    elif args.query:
        query(client,str(args.query))
    elif args.createDB:
        createDB(client,args.createDB)

def parse_args():
    parser = argparse.ArgumentParser(
        description='InfluxDB driver script')
    parser.add_argument('--host', type=str, required=False, default='localhost',
                        help='hostname of InfluxDB http API')
    parser.add_argument('--port', type=int, required=False, default=8086,
                        help='port of InfluxDB http API')
    parser.add_argument('--db', type=str, required=False, default='devicelog',
                        help='hostname of InfluxDB http API')
    parser.add_argument('--write', type=str, required=False,
                        help='JSON with write data')
    parser.add_argument('--query', type=str, required=False,
                        help='Query string')
    parser.add_argument('--createDB', type=str, required=False,
                        help='Create new Database')
    return parser.parse_args()


if __name__ == '__main__':
    args = parse_args()
    main(args)
