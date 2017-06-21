#!/usr/bin/env bash

# Install nodejs , npm and pm2
sudo apt-get install -y curl
sudo apt-get install -y build-essential
curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install npm@latest -g
sudo npm install pm2@latest -g
# Install MongoDB
sudo apt-get install -y mongodb

curl -sL https://repos.influxdata.com/influxdb.key | sudo apt-key add -
source /etc/lsb-release
echo "deb https://repos.influxdata.com/${DISTRIB_ID,,} ${DISTRIB_CODENAME} stable" | sudo tee /etc/apt/sources.list.d/influxdb.list
sudo apt-get update && sudo apt-get install -y influxdb
sudo service influxdb start

sudo apt-get install -y python-pip
sudo pip install influxdb


cd /vagrant
npm install

cd services/database
chmod +x influxDriver.py
