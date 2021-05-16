const parseCommaFloat = (prop) => {
	if (!prop) return null;
	return parseFloat(prop.replace(',', '.'));
}

module.exports = {
	parseCommaFloat,
}