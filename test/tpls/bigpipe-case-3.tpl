<div>
    {% component $id="header" $replace="true" /%}
    {% chunk $id="header" $require="header" /%}
    <div class="list">list</div>
    {% chunk $id="list" $require="list" /%}
</div>