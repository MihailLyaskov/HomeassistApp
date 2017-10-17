# Homeassist application
## Install:
  ### Install Vagrant if testing
  Intall [Vagrant](https://www.vagrantup.com/docs/installation)
  ### If using Vagrant:
     vagrant up
     vagrant ssh
     cd /vagrant/

  ### If installing on Debian Jessie 8 (ARM)
    ./install.sh


## Change timezone:
```sh
sudo dpkg-reconfigure tzdata
```

## Application:
  ### Config
  The configuration file for this application is located in config/default.json .
  Before starting you need to edit this file by adding your refresh Token for Devicehive Playground or local server.

  ### Start
  ```sh
    pm2 start services.config.yaml
  ```

  ### Stop
  ```sh
    pm2 kill
  ```

## Run tests for database or schedule:

  ### Database
  ```sh
    nodejs services/Devicehive/tests/integrationTestDatabase.js
  ```

  ### Schedule
  ```sh
    nodejs services/Devicehive/tests/integrationTestSchedule.js
  ```

  ### Full demo
  ```sh
    ./demo.sh
  ```
