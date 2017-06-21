# ha-database-service

To change timezone:
sudo dpkg-reconfigure tzdata

Create inflixdb database:
influxdb
create database devicelog

Run tests for connector and database:
npm run dbTest
