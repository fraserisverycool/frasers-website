# Fraser's Website

Angular project! A place to put all the shit I used to put on Social Media before the Algorithm ruined everything

# How to get it running

## Connect to the Raspberry Pi
I currently run this on a raspberry pi but you can obvious put it anywhere. You need to find what IP address your server has, which you can do by opening the terminal of said server and typing: `ifconfig -a`

Then I recommend you set it up so that you can ssh into your raspberry pi from your normal computer. For example:

```ssh fraserbowen@your-ip-address-here```

You can move files to your server either using git (for example pulling this repository) or using scp:

```scp your-file.json fraserbowen@your-ip-address-here:/home/fraserbowen/Documents/frasers-website/```

Don't forget to install node, and then all the project's dependencies after you have pulled the project:
https://nodejs.org/en/download

```npm install```

## Set up a Cloudflare tunnel
Cloudflare is awesome. It's a free service that does your DNS for you! In order to set it up, you need to log into whatever service provides your domain name (in my case it was GoDaddy.com) and give them access to your Cloudflare account. There's are plenty of nice tutorials for how to do this online.

After you've done that, you can install cloudflared locally on your raspberry pi and set up a tunnel. The config for it will be in this file:

```/etc/cloudflared/config.yml```

Make sure to set the port that your tunnel listens to as `80` (the standard port for web traffic). This means that anything running on `http://localhost:80` will be made available via the tunnel on your domain.

Once you have it set up, this is the command to run cloudflared:

```sudo systemctl start cloudflared```

If something is wrong, be sure to check the status, adjust the config and restart:

```sudo systemctl status cloudflared```
```sudo systemctl restart cloudflared```

## Database
This project has a database running in a cute little express server. The volume itself is `database.sqlite` so be sure to back that up from time to time. The magic happens in `database.js`.

You can run this in the background using `pm2` a useful library for running things in the background: https://pm2.io/docs/runtime/guide/installation/
```
pm2 --name FrasersDatabase start database.js
pm2 ps
pm2 delete 0
pm2 logs
```

It's good to set up a cronjob for backups

```crontab -e```

Put this in the file:

```0 2 * * * /home/fraserbowen/Documents/frasers-website/backup.sh```

## Nginx
In order to run our Angular project in production mode, it's really good to use nginx, a useful way of serving built projects. It can do a bunch of stuff!

```npm install nginx```

You should then put a config file called `frasers-website` in this directory:

```/etc/nginx/sites-available/```

And also set up this symlink:

```sudo ln -s /etc/nginx/sites-available/frasers-website /etc/nginx/sites-enabled/frasers-website```

This means that nginx will automatically run any project that has been built. It makes life a lot easier.
In the nginx directory of this repo you will find an example config that you can use. Make sure the 'root' points to where you bulid your project, and also make sure it points to port 80.

To build the Angular project you can use this command:

```ng build --configuration=production```

This will put the built project in the the 'dist/frasers-website' folder. This is where nginx should look.

Finally, you can start nginx just like you do with cloudflared:

```sudo systemctl start nginx```

And be sure to check status and logs if there are issues:
```
sudo systemctl status nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Dev mode for testing
You can also just run the Angular project locally pretty easily if you want to run it locally on your computer for development:

```npm run start```

This will put the website on ```http://localhost:4200``` which you can access in your browser.

Alternatively with pm2:

```pm2 --name FrasersWebsite start npm -- start```
