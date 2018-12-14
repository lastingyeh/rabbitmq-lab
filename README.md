# RabbitMQ 筆記本

## 安裝

    $ brew update

    $ brew install rabbitmq

預設安裝在 /usr/local/sbin，若 sbin 不存在則使用以下命令建立

    $ cd /usr/local/
    
    $ sudo mkdir sbin

更改檔案權限

    $ sudo chown -R $(whoami) $(brew –prefix)/* 

若 mac os 非 High Sierra，則使用 

    $ sudo chown -R $(whoami) $(brew --prefix)

最後再執行 

    $ brew link rabbitmq

啟動 rabbitmq-server，開啟瀏覽器 localhost:15672 (設定檔位置: /usr/local/sbin/rabbitmq-server)

    $ rabbitmq-server

錯誤排除方式：

1. [Operation Not Permitted](https://www.barretlee.com/blog/2016/04/06/operation-not-permitted-problem-in-linux-or-unix-system/) 

2. Remove And Reinstall

    2.1 brew uninstall --force rabbitmq

    2.2 brew prune

---

## 模組使用 (Javascript & NodeJS)

    $ npm install amqplib --save
---
## 範例

 * hello-world: sender & receive 連接 rabbitmq-server，透過 Channel 與 單一 Queue 傳送與接收訊息．

 * work-queues: sender 使用單一 Queue 分配給多個 receiver 藉此處理耗時工作 (http request)

 * pub-sub: sender 透過 exchange 機制(處理|附加|丟棄) 將訊息廣播(fanout)至不同 Queue 發送訂閱

    重點參數設定

        ch.assertExchange(exchangeName, 'fanout', opts)

 * routing: 將 fanout 修改為 direct，並透過 publish routingKey 傳送訊息到特定對應 routingKey 的 Queue 發送訂閱

    重點參數設定

        ch.assertExchange(exchangeName, 'direct', opts)

 * topics: 彈性的實現複雜的 routing_key 發送訂閱機制

    重點參數設定

        ch.assertExchange(exchangeName, 'topic', opts)

    用 dot 分隔建立 Routing-Key 規則
        
        * 任一字元

        # 0 - n 字元

* rpc: receiver 請求傳送訊息 => 請求Queue  => 請求Queue => 遠端 Server 處理 => 再回呼 回應Queue => 訊息回到 receiver

    重點說明

        請求 Queue 設定 reply_to 對應 回應Queue 名稱

        請求 Queue && 回應 Queue 的 collection_id 必須相同(不然訊息會被丟棄)

---
## 實用命令列

### 列出所有 Queue資料筆數

    $ sudo rabbitmqctl list_queues

### 檢查 Queue中被忽略確認筆數 (未呼叫 ch.ack(msg))

#### mac 
    
    $ sudo rabbitmqctl list_queues name messages_ready messages_unacknowledged

#### window

    $ rabbitmqctl.bat list_queues name messages_ready messages_unacknowledged
---
## 參數筆記

### 確認任務完成

ch.consume(queue, callback, opts)

* 設定 {noAck: false} => 必須在任務完成後呼叫 ch.ack(msg) 確認完成

### 訊息保存性 (預防 rabbitmq 異常時，資料仍完整保存)

ch.assertQueue(queue, opts)

* 設定 {durable: true}

ch.sendToQueue(queue, buffer, opts)

* 設定 {persistent: true}

### 設定 prefetch，讓 Queue 根據目前 client 忙碌狀態分配訊息傳遞 (初始設定為平均分配)

* ch.prefetch(count, global?);

### fanout 說明：將訊息廣播至所有 Queue

* ch.assertExchange(exchange, 'fanout', opts);

---
### 訊息模糊比對範例 (參數為 topic)

* sender 發送 RoutingKey 'kern.critical'

* receiver 收到訊息解析 (可自行設定多個篩選 RoutingKey)

        (v) # (同廣播)      

        (v) *.critical

        (v) kern.*

        (v) *.*

        (x) *.abc

        (x) *.critical.*

---
### RPC 訊息參數說明

    * persistent 訊息持續性

    * content_type 資料型別設定，通常為 application/json

    * reply_to 通常為回傳的 queue名稱

    * correlation_id PRC相關請求的回應訊息





