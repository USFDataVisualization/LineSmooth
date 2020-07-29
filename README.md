# LineSmooth: An Analytical Framework for Evaluating the Effectiveness of Smoothing Techniques on Line Charts
## Paul Rosen and Ghulam Jilani Quadri
## Transactions on Visualization and Computer Graphics, 2021
## Proceedings of VAST, 2020

This package contains our source code, data, and a web-based demonstration.


## To run the demo:

We have tested this setup on Mac and Linux distributions. 

You may visit live versions of this package at __https://usfdatavisualization.github.io/LineSmoothDemo/__  

### [required] Install python3, python3-virtualenv, and git

    On Debian linux, such as Ubuntu
    > sudo apt install python3 python3-virtualenv git

    On Mac, you can download from python.org, macports, or homebrew. You will need python3, python3-virtualenv, pip, git, ... maybe others 


### [required] Run setup process

    This process will setup a virtual environment and install all prerequisites.
    > ./setup.sh
        
### [required] Generate the experiemental and start a webserver

    Run the server
    > ./run_server.sh
    
    If everything goes as planned, you can open a webbrowser and open url http://localhost:5250
    
