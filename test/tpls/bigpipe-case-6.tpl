<div>
    <div class="header"></div>
    {% chunk $id="header" $require="header" /%}
    <div class="list">
        <div>title</div>
        {% chunk $id="list" $require="list, header" /%}
    </div>
</div>