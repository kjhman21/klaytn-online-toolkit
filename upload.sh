#!/bin/bash
npm run build
tar -cvzf kbm-auth.tgz build
scp kbm-auth.tgz colin_ec2: