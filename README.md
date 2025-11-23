# Fraser's Website

Angular project! A place to put all the shit I used to put on Social Media before the Algorithm ruined everything

# How to get it running

## Connect to the Raspberry Pi
I currently run this on a raspberry pi but you can put it anywhere. You need to find what IP address your server has, which you can do by opening the terminal of said server and typing: `ifconfig -a`

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

It's good to set up a cronjob for backups. Please install gzip on your server!

```crontab -e```

Put this in the file:

```0 2 * * * /home/fraserbowen/Documents/frasers-website/backup.sh >> /home/fraserbowen/Documents/frasers-website/backup.log 2>&1```

Both this command and the absolute paths within backup.sh you should change to whatever path you have the repo installed on your server.

Also part of this script is "rclone" which uploads the backups to Google Drive. You can install rclone on your server and do the same, although you have to go through a set up process with your Google account. The link to my Google Drive is here: https://drive.google.com/drive/folders/1nkGY0eDPV38OAJspq_25Vfc5BQnejXb6?usp=sharing

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

```ng build --configuration production```

This will put the built project in the 'dist/frasers-website' folder. This is where nginx should look.

Finally, you can start nginx just like you do with cloudflared:

```sudo systemctl start nginx```

And be sure to check status and logs if there are issues:
```
sudo systemctl status nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Scripts
In the scripts folder you can find some useful python scripts.

- add-ids.py: This goes through all the json files and adds a UUID to any item missing one
- add-daily-soundtracks.py: This generates empty entries for the next month
- sync-assets-to-server.py: This takes all the images and assets in your assets folder and plomps them on the server (because they're not checked into git)
- sync-assets-from-server.py: This takes all the images and assets currently plomped on the server and downloads them to your local machine
- newsletter/generate-newsletter.py: This goes through all the items that have 'newsletter: false' and aggregates them into a json file, together with a title and description
- newsletter/publish-newsletter.py: This updates the rss feed with all the newsletters in the newsletter directory
- newsletter/add-newsletter.py: This updates all the items with 'newsletter: true' to indicate that they have appeared in a previous newsletter
- gallery/prepare-secrets.py: This takes the backend info needed for the gallery page and puts it in the database (this needs to be run on the server)
- gallery/check-secrets.py: This double checks what gallery info is in the database currently
- pokemon/download-pokemon.py: This downloads images of every pokemon from Bulbapedia
- pokemon/pokemon-app.py: This is a web server which helped me organise the pokemon into tiers
- pokemon/pokemon-json.py: This organised image data into a convenient json file

## Assets
At some point I decided to put all my assets separately on the server and not part of the Angular assets. This was because this website has thousands of images and all those mp3s on the music page, and it takes like 10 minutes to build. Also it didn't feel right to put all that stuff on git.

So you need to have a directory on the server called:
```
/var/www/images/
```
And be sure to set permissions:
```
sudo chown -R $USER:www-data /var/www/images
sudo find /var/www/images -type d -exec chmod 755 {} \;
```
Next, you can access all the assets here: https://drive.google.com/drive/folders/14ECYzrYdB_VG0d3Wpk0Ts9urgCPhK1gV?usp=sharing - I'll update this occasionally.

These assets go in the repository folder "src/assets". Some things are already checked in there but you can fill it up. Then, you can sync it with the server using this script:
- sync-assets-to-server.py

If you would like to pull any new assets from the server to your local machine (if you are developing from multiple devices) you can do so with this script:
- sync-assets-from-server.py

The app will check your local assets folder when you run it with npm run start, and when running on production will check the folder on the server instead (it's in the nginx settings).

## Dev mode for testing
You can also just run the Angular project locally pretty easily if you want to run it locally on your computer for development:

```npm run start```

This will put the website on ```http://localhost:4200``` which you can access in your browser.

Alternatively with pm2:

```pm2 --name FrasersWebsite start npm -- start```
