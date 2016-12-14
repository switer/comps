<div class="main">
	<div class="content">
		<ul>
			<% list.forEach(function(item, index){ %>
				<li>索引 <%= index %> ：<%= item %></li>
		    <% }) %>
		</ul>
	</div>
</div>