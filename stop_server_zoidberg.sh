#!/bin/bash

PIDLINE=`cat run_server_zoidberg.log | grep "Listening at"`
PID=`echo $PIDLINE | cut -d "[" -f3 | cut -d "]" -f1`
kill $PID
