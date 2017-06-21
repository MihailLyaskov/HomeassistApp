# ha-database-service
To change timezone:
```sh
sudo dpkg-reconfigure tzdata
```
Create inflixdb database:
```sh
influxdb
create database devicelog
```
Run tests for connector and database:
```sh
npm run dbTest
```
