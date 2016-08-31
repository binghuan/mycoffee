REPORTER = dot
PROJECT = coffeenearby

create:
	# git init
	# git add .
	# git commit
	heroku apps:create ${PROJECT}
	heroku git:remote -a coffeenearby

push:
	#  dotcloud push --application ${PROJECT}
	git push heroku master

local:
	foreman start

open:
	heroku open

test:
	  NODE_ENV=test ./node_modules/.bin/mocha \
		      --reporter $(REPORTER) \

