import StandardUnitConverter from './converters/StandardUnitConverter';
import TemperatureConverter from './converters/TemperatureConverter';
import ProgrammerConverter from './converters/ProgrammerConverter';
import CssUnitConverter from './converters/CssUnitConverter';

export default function ConverterView({
    category = 'length',
    categories = [],
    handleCategoryChange,
    copiedKey,
    copyText,

    baseValues,
    handleBaseChange,

    cssPx,
    setCssPx,
    cssRoot,
    setCssRoot,
    cssRem,
    handleRemChange,

    fromValue,
    setFromValue,
    fromUnit,
    setFromUnit,
    toUnit,
    setToUnit,
    convertedUnitValue,
    unitDefinition,
    quickGrid = [],
    swapUnits,

    tempValue,
    setTempValue,
    tempFrom,
    setTempFrom,
    tempTo,
    setTempTo,
    convertedTemp
}) {
    return (
        <div className="flex-1 flex flex-col p-3 select-none overflow-hidden min-h-0">
            {/* Category Chips Bar */}
            <div className="flex gap-1 overflow-x-auto scrollable pb-2 mb-2 border-b border-white/10 shrink-0">
                {categories.map(cat => {
                    const isActive = category === cat.id;
                    return (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => handleCategoryChange(cat.id)}
                            className="px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border shrink-0"
                            style={{
                                backgroundColor: isActive ? 'var(--color-widget-active)' : 'rgba(255, 255, 255, 0.05)',
                                color: isActive ? 'var(--color-widget-text)' : 'rgba(255, 255, 255, 0.6)',
                                borderColor: isActive ? 'var(--color-widget-active-hover)' : 'rgba(255, 255, 255, 0.1)'
                            }}
                        >
                            {cat.label}
                        </button>
                    );
                })}
            </div>

            {/* Content Area Based on Active Category - Full smooth vertical scrolling */}
            <div className="flex-1 overflow-y-auto scrollable flex flex-col gap-2.5 pr-1 min-h-0 pb-4">
                {unitDefinition && (
                    <StandardUnitConverter
                        unitDefinition={unitDefinition}
                        fromValue={fromValue}
                        setFromValue={setFromValue}
                        fromUnit={fromUnit}
                        setFromUnit={setFromUnit}
                        toUnit={toUnit}
                        setToUnit={setToUnit}
                        convertedUnitValue={convertedUnitValue}
                        quickGrid={quickGrid}
                        swapUnits={swapUnits}
                        copyText={copyText}
                        copiedKey={copiedKey}
                    />
                )}

                {category === 'temp' && (
                    <TemperatureConverter
                        tempValue={tempValue}
                        setTempValue={setTempValue}
                        tempFrom={tempFrom}
                        setTempFrom={setTempFrom}
                        tempTo={tempTo}
                        setTempTo={setTempTo}
                        convertedTemp={convertedTemp}
                        swapUnits={swapUnits}
                        copyText={copyText}
                        copiedKey={copiedKey}
                    />
                )}

                {category === 'programmer' && (
                    <ProgrammerConverter
                        baseValues={baseValues}
                        handleBaseChange={handleBaseChange}
                        copyText={copyText}
                        copiedKey={copiedKey}
                    />
                )}

                {category === 'css' && (
                    <CssUnitConverter
                        cssPx={cssPx}
                        setCssPx={setCssPx}
                        cssRoot={cssRoot}
                        setCssRoot={setCssRoot}
                        cssRem={cssRem}
                        handleRemChange={handleRemChange}
                        copyText={copyText}
                        copiedKey={copiedKey}
                    />
                )}
            </div>
        </div>
    );
}
