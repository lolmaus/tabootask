
# some more ls aliases
alias ll='ls -alhF'
alias la='ls -A'
alias l='ls -CF'

# git
alias gs="git status"
alias gps="git push"
alias gpl="git pull"
alias gc="git commit"
alias gco="git checkout"
alias gb="git branch"
alias ga="git add"
alias gA="git add -A"
alias gl="git --no-pager log --decorate=short --pretty=format:'%Cred%h%Creset - %s %Cgreen(%cr) %C(bold blue)<%an>%C(yellow)%d%Creset' -n5"

# npm
alias ni="t npm i"
alias nc="t sh -c 'npm ci'"
alias nr='t npm run'
 
# General purpose
alias t="/usr/bin/time -f $'\e\033[32m\033[42m\033[97m Command took: %E \033[40m\033[32m\033[0m'"