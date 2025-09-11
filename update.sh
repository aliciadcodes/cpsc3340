#!/bin/bash

IP = $(hostname -I)
echo "$IP" >> ~/cpsc3340/ip.md

cp ~/.config config