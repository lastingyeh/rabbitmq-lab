# RabbitMQ 筆記本

## 安裝

    $ brew update

    $ brew install rabbitmq

預設安裝在/usr/local/sbin，若sbin不存在則使用以下命令建立

    $ cd /usr/local/
    
    $ sudo mkdir sbin

更改檔案權限

    $ sudo chown -R $(whoami) $(brew –prefix)/* 

若MAC OS非High Sierra，使用 

    $ sudo chown -R $(whoami) $(brew --prefix)

最後再執行 

    $ brew link rabbitmq

啟動rabbitmq-server，開啟瀏覽器localhost:15672(檔案路徑:/usr/local/sbin/rabbitmq-server)

    $ rabbitmq-server

錯誤排除方式：

1. [Operation Not Permitted](https://www.barretlee.com/blog/2016/04/06/operation-not-permitted-problem-in-linux-or-unix-system/) 

2. Remove And Reinstall

    2.1 brew uninstall --force rabbitmq

    2.2 brew prune

---

## 模組使用(Javascript & NodeJS)

    $ npm install amqplib --save
---
## 範例

 * hello-world: sender & receive連接rabbitmq-server，透過Channel與單一Queue傳送與接收訊息．

 * work-queues: sender使用單一Queue分配給多個receiver藉此處理耗時工作(http request)

 * pub-sub: sender透過exchange機制(處理|附加|丟棄)將訊息廣播(fanout)至不同Queue發送訂閱

    重點參數設定

        ch.assertExchange(exchangeName, 'fanout', opts)

 * routing: 將fanout修改為direct，並透過publish routingKey傳送訊息到特定對應routingKey的Queue發送訂閱

    重點參數設定

        ch.assertExchange(exchangeName, 'direct', opts)

 * topics: 彈性的實現複雜的routing_key發送訂閱機制

    重點參數設定

        ch.assertExchange(exchangeName, 'topic', opts)

    用dot(.)建立分隔Routing-Key規則
        
        * 任一字元

        # 0 - n 字元

* rpc: receiver請求傳送訊息 => 請求Queue  => 請求Queue => 遠端Server處理 => 再回呼'回應Queue' => 訊息回到receiver

    重點說明

        '請求Queue'設定reply_to對應'回應Queue'名稱

        '請求Queue'&&'回應Queue'的correlation_Id必須相同(不然訊息會被丟棄)

---
## 常用CLI提示命令

### 列出所有Queue資料筆數

    $ sudo rabbitmqctl list_queues

### 檢查Queue中被忽略確認筆數(未呼叫 ch.ack(msg))

#### MAC 
    
    $ sudo rabbitmqctl list_queues name messages_ready messages_unacknowledged

#### WINDOW

    $ rabbitmqctl.bat list_queues name messages_ready messages_unacknowledged
---
## 參數筆記

### 確認任務完成

ch.consume(queue, callback, opts)

* 設定 {noAck: false} => 必須在任務完成後呼叫 ch.ack(msg) 確認完成

### 訊息持久設定(預防rabbitmq異常時，資料仍完整保存)

ch.assertQueue(queue, opts)

* 設定{durable: true}

ch.sendToQueue(queue, buffer, opts)

* 設定{persistent: true}

### 設定prefetch，讓Queue根據目前client忙碌狀態分配訊息傳遞(初始設定為平均分配)

* ch.prefetch(count, global?);

### fanout說明：將訊息廣播至所有Queue

* ch.assertExchange(exchange, 'fanout', opts);

---
### 訊息模糊比對範例 ( 參數為topic )

* sender發送RoutingKey: 'kern.critical'

* receiver收到訊息解析(可自行設定多個篩選RoutingKey)

        (v) # => 同廣播   

        (v) *.critical

        (v) kern.*

        (v) *.*

        (x) *.abc

        (x) *.critical.*

---
### RPC訊息參數說明

    * persistent: 訊息持續性

    * content_type: 資料型別設定，通常為application/json

    * reply_to: 通常為回傳的queue名稱

    * correlation_id PRC: 相關請求的回應訊息





