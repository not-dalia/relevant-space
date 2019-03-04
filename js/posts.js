---

---
{% assign posts=site.posts %}
var posts = [
    {% for post in posts %}
      {% include post.json %}{% unless forloop.last %},{% endunless %}
    {% endfor %}
]