# Colu Backend Example

Issue 2 assets: 50 Spiderman Tickets and 30 Batman Tickets
```
$ curl -i \ 
    -H "Content-Type: application/json" \ 
    -X PUT -d '{ "assets": [{"assetName":"Spiderman Ticket", "amount":50}, {"assetName":"Batman Ticket", "amount": 30}] }' \ 
    http://localhost:3000/issue
["La8xHrvKpqt6iPFf6vZBtsBFr8DeNG4uwHie59","La3nM6rws7LYzkBrWZ3AZgq4dpxwFjEoWW4FY2"]
```

Send 50 Spiderman Tickets to address 'mypgXJgAAvTZQMZcvMsFA7Q5SYo1Mtyj2a'
```bash
$ curl -i \ 
    -H "Content-Type: application/json" \ 
    -X POST -d '{ "toAddress": "mypgXJgAAvTZQMZcvMsFA7Q5SYo1Mtyj2a", "assetId": "La8xHrvKpqt6iPFf6vZBtsBFr8DeNG4uwHie59", "amount": 2}' \ 
    http://localhost:3000/send
{"transactionId":"40dbbc31cd96d02cdd27373ee1612122f38c618b081e356f7ecf0ccc21b95571"}
```

Show all asset ids:
```bash
$ curl -i http://localhost:3000/assets
["La8xHrvKpqt6iPFf6vZBtsBFr8DeNG4uwHie59"]
```
