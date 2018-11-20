---
layout: post
title:  "How I added comments to a Jekyll blog"
date:   2018-11-19 11:55:01 +0000
published: true
categories: jekyll
tags:
  - tech
  - comments
  - jekyll
  - blog
---

When I was creating the theme for this blog, I thought that I'd add a comment section using disqus or something similar, but it felt a bit sad that I'd have to use a third party service when [Jekyll](https://jekyllrb.com/) is so good for keeping things within the blog's repo. So I had the ~~brilliant~~ idea of creating a comments section that's purely based on GitHub API + GitHub Pages. The idea I had in mind was: 
  - Create a Jekyll collection with no output. To do so, I added the following to `_config.yml`:
    ```
      collections:
        comments:
          output: false
    ```
    and create a `_comments` folder to represent your comments collection. (For more info on creating collections: [Jekyll Collections](https://jekyllrb.com/docs/step-by-step/09-collections/))
  - For each comment, create a file in the `_comments` folder that has a reference field (`ref`) to the blog for which the comment is posted. For this, I assigned the `ref` field to be the `post.id`. Example comment:
    ```
      ---
      ref: /2018/11/15/test-post
      title: Test Post
      name: Comment Poster
      date: '2018-11-16T16:31:01.038Z'
      comment: This is a test comment 
      ---
    ```
    I chose to put the comment content in a `comment` field rather than to be the main content because I was experimenting with keeping all the comments relevant to one post in one file, but I later decided to break it down to a single file per comment since it makes it easier to find and archive comments if needed.
  - When someone posts a new comment, the comment file is generated client-side and committed to the blog's repo using [GitHub Contents API](https://developer.github.com/v3/repos/contents/). 
  - In `post` layout, look for and render all comments that have a `ref` field that matches the `post.id`. Example:
    {% highlight html %}
    {% raw %}
    {% for item in site.comments %} {% if item.ref == post.id %}
    <div class="comment-item">
      <p>  
        {{ item.comment | markdownify}}
      </p>
      <p> Posted by {{ item.name }} on {{ item.date | date: "%e %b %Y @ %l:%M %p" }} </p>
    </div>
    {% endif %} {% endfor %}
    {% endraw %}
    {% endhighlight %}

### What actually happened
#### Rendering comments content
Once I started implementing this idea, I came across a number of issues. The first was rendering the comments: I didn't want to render any user-entered HTML, but I wanted to support markdown. Jekyll lets you escape html tags using the `xml_escape` filter, but this also escapes blockquotes for markdown since it's just a `> ` symbol. I ended up using an ugly hack to fix this: 
{% highlight html %}
{% raw %}
{{ item.comment | xml_escape | replace: "&gt;", ">" | markdownify}} 
{% endraw%}
{% endhighlight %}
So basically since `xml_escape` escapes tags by replacing `<` and `>` with `&lt;` and `&gt;` respectively, this replaced all occurences of `&gt;` back to `>` before rendering the markdown, successfully rendering blockquotes. However, this messed up rendering code blocks since all `<` occurences ended up showing as `&lt;`. I fixed this using an even uglier hack: 
{% highlight html javascript%}
  <script>
    var codeBlock = document.getElementsByTagName("code");
    for (var i = 0; i < codeBlock.length; i++) {
      codeBlock[i].innerText = codeBlock[i].innerText.replace(/&lt;/g, "<");
    }
  </script>
{% endhighlight %}
I have a feeling that this is a terrible solution. So if you have any better suggestions please leave them in the comment box down below.

   

#### (Not) Using GitHub REST API from the browser
Committing using GitHub API is quite simple but it requires an [access token](https://developer.github.com/v3/#authentication). For this, I chose to create a Personal Access Token that I would be using with all requests to GitHub API. The main issue with doing this from the browser is that I would have to expose my personal access token publicly. **DON'T DO THIS, it is an extremely bad idea**. So after some contemplation, I had to give up on the idea of making everything client based and contained withing my jekyll blog. Instead, I created a tiny NodeJs HTTP-forwarder and put it on [Heroku](https://www.heroku.com/). What it does is that it takes whatever request it gets, changes the host to api.github.com, and adds the authorization header (the personal access token) without having to expose it client-side, then it returns whatever response it gets from GitHub API. So to create a comment, the client would construct a commit request but instead of sending it to github, it sent it to the HTTP-forwarder. A very minimal version of the HTTP-forwarder would be:
{% highlight javascript%}
const http = require("http");
const httpProxy = require("http-proxy");
const proxy = httpProxy.createProxyServer({});
const server = http.createServer().listen(process.env.PORT);

const baseUrl = "api.github.com";

server.on("request", (req, res) => {
  req.headers.host = baseUrl;
  req.headers.Authorization = `token ${process.env.GH_PAT}`;
  proxy.web(req, res, { target: `https://${baseUrl}` });
});
{% endhighlight%}


#### GitHub Pages cache control 
When I considered using commits for adding comments, I thought that it would probably take a few seconds and maybe even a minute or two for the comment to render since GitHub needs to re-generate the blog pages to include new comments. What I didn't consider was that GitHub Pages headers set cache-control max-age to 600s (=10 minutes). So if you post a new comment you'd either need to wait a considerable amount of time or hard-reload the post page. I couldn't find a way (yet) to overcome this but I haven't given up yet because this is _REALLY FRUSTRATING_. If you have any ideas for how to overcome this I'd be very happy to hear them. 



### Final thoughts
I can't say I'm anywhere near a good developer, and while trying to implement this, I made a lot of mistakes but I also learnt quite a lot of things. This really was the point of this blog; a sort of training dungeon where I can experiment both with code and practice writing posts. I can't say I'm satisfied with how the comments work right now (mainly because of the caching problem), but I'm happy with the outcome despite all the flaws in my plan and implementation.


