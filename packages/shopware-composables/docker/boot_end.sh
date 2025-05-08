#!/bin/bash

export COMPOSER_HOME=/var/www

bin/console database:migrate --all
bin/console cache:clear
composer require teamnovu/shopware-headless-plugin
bin/console plugin:refresh
bin/console plugin:install --activate NovuShopwareHeadlessPlugin
bin/console cache:clear

echo "Custom Setup Done :)"
