<div class="main">
	<div class="content">
		<ul>
			${data.list.map(function (item, i) {

				return `{%component $id="item"/%}`

			}).join('')}
		</ul>
	</div>
</div>