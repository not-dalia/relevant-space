---
layout: post
title:  "Found on StackOverflow: What technology does Google Drive use to get real-time updates?"
date:   2018-11-12 09:40:01 +0000
published: true
categories: google-drive tech bookmarks
tags:
  - google-drive
  - tech
  - no-polling
  - bookmarks
---
Found this while browsing StackOverflow. Posting it here to bookmark it.

[What technology does Google Drive use to get real-time updates?](https://stackoverflow.com/questions/35070217/what-technology-does-google-drive-use-to-get-real-time-updates)

> ### Is there a name for Google's solution for real-time updates in Drive (such as "long polling" or "sockets")?
>It didn't have a name until now. I'll call it "no-polling," to contrast with polling and long-polling. 
>
>With polling, the client periodically sends queries for new data.
>
>With long-polling, the client queries for data, and the server holds onto the request, ending the response with the updates when there are updates.
>
>No-polling (what Google Drive does) takes advantage of how the browser can read data from the body of a request before the request is complete. So as collaborators do more typing and edits, the server appends more data to the current request. If certain limits are met (length of the content or duration of the request), the request completes, and the client initiates a new request with the server.
>
> ### How can I try implementing this?
>For the client to send updates to the server: this can be done with normal POSTs.
>
>For the client to subscribe to updates from the server:
>
> * The client sends a GET for an update stream, then starts reading the body of the response before the response is complete. 
> > XHR objects can emit progress events before the request is complete. The (partial) response is accessible using  xhr.responseText. There's no simple way to watch for progress with fetch yet (as of May 2016).
>
> * The client should initiate a new request when the current request ends.
>
>The server has to:
>
> * Keep track of which clients are subscribed to which update streams.
> * When a request comes in for a particular update stream, write data to the response, but don't complete the response until the amount of data gets large or a timeout is met.
>
>No-polling seems superior to long-polling, in my opinion, though I haven't played with it much. Long-polling forces a trade-off between latency and message size (given a constant rate of updates), a trade-off no-polling doesn't have to make. Another disadvantage of long-polling is that it can lead to many HTTP requests, paying the overhead of HTTP each time.
>
>No-polling's big advantage over WebSockets is that no-polling is supported by every browser, though WebSocket support is pretty good — IE10+.