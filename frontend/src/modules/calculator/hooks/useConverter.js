import { useState, useMemo, useCallback } from 'react';

// Unit conversion factors relative to base unit
const UNIT_DEFINITIONS = {
    length: {
        name: 'Length & Distance',
        base: 'm',
        units: [
            { id: 'mm', label: 'Millimeters (mm)', ratio: 0.001 },
            { id: 'cm', label: 'Centimeters (cm)', ratio: 0.01 },
            { id: 'm', label: 'Meters (m)', ratio: 1 },
            { id: 'km', label: 'Kilometers (km)', ratio: 1000 },
            { id: 'in', label: 'Inches (in)', ratio: 0.0254 },
            { id: 'ft', label: 'Feet (ft)', ratio: 0.3048 },
            { id: 'yd', label: 'Yards (yd)', ratio: 0.9144 },
            { id: 'mi', label: 'Miles (mi)', ratio: 1609.344 },
        ]
    },
    mass: {
        name: 'Weight & Mass',
        base: 'g',
        units: [
            { id: 'mg', label: 'Milligrams (mg)', ratio: 0.001 },
            { id: 'g', label: 'Grams (g)', ratio: 1 },
            { id: 'kg', label: 'Kilograms (kg)', ratio: 1000 },
            { id: 'oz', label: 'Ounces (oz)', ratio: 28.349523 },
            { id: 'lb', label: 'Pounds (lb)', ratio: 453.59237 },
        ]
    },
    time: {
        name: 'Time & Duration',
        base: 's',
        units: [
            { id: 'ms', label: 'Milliseconds (ms)', ratio: 0.001 },
            { id: 's', label: 'Seconds (s)', ratio: 1 },
            { id: 'min', label: 'Minutes (min)', ratio: 60 },
            { id: 'h', label: 'Hours (h)', ratio: 3600 },
            { id: 'd', label: 'Days (d)', ratio: 86400 },
            { id: 'wk', label: 'Weeks (wk)', ratio: 604800 },
        ]
    },
    storage: {
        name: 'Data & Storage',
        base: 'B',
        units: [
            { id: 'B', label: 'Bytes (B)', ratio: 1 },
            { id: 'KB', label: 'Kilobytes (KB)', ratio: 1024 },
            { id: 'MB', label: 'Megabytes (MB)', ratio: 1024 ** 2 },
            { id: 'GB', label: 'Gigabytes (GB)', ratio: 1024 ** 3 },
            { id: 'TB', label: 'Terabytes (TB)', ratio: 1024 ** 4 },
            { id: 'PB', label: 'Petabytes (PB)', ratio: 1024 ** 5 },
        ]
    }
};

export function useConverter() {
    // Categories ordered: Basic (length, mass, temp, time) -> storage -> programmer (base) -> css
    const [category, setCategory] = useState('length');

    // --- GENERAL UNIT CONVERTER ---
    const [fromValue, setFromValue] = useState('1');
    const [fromUnit, setFromUnit] = useState('m');
    const [toUnit, setToUnit] = useState('cm');

    // --- TEMPERATURE CONVERTER ---
    const [tempValue, setTempValue] = useState('25');
    const [tempFrom, setTempFrom] = useState('C');
    const [tempTo, setTempTo] = useState('F');

    // --- PROGRAMMER (BASE/RADIX) CONVERTER ---
    const [decVal, setDecVal] = useState('255');
    const [copiedKey, setCopiedKey] = useState(null);

    // --- CSS / WEB CONVERTER ---
    const [cssPx, setCssPx] = useState('16');
    const [cssRoot, setCssRoot] = useState('16');

    const baseValues = useMemo(() => {
        let num = parseInt(decVal, 10);
        if (isNaN(num)) num = 0;

        const safeNum = Math.max(0, Math.min(Number.MAX_SAFE_INTEGER, num));
        const rawBin = safeNum.toString(2);
        const paddedBin = rawBin.padStart(Math.ceil(rawBin.length / 4) * 4 || 4, '0');
        const formattedBin = paddedBin.match(/.{1,4}/g)?.join(' ') || rawBin;

        return {
            dec: safeNum.toString(10),
            hex: safeNum.toString(16).toUpperCase(),
            bin: formattedBin,
            rawBin: safeNum.toString(2),
            oct: safeNum.toString(8)
        };
    }, [decVal]);

    const handleBaseChange = (type, val) => {
        if (!val || val.trim() === '') {
            setDecVal('0');
            return;
        }

        try {
            let decimalNum = 0;
            if (type === 'dec') {
                decimalNum = parseInt(val.replace(/[^0-9]/g, ''), 10) || 0;
            } else if (type === 'hex') {
                decimalNum = parseInt(val.replace(/[^0-9a-fA-F]/g, ''), 16) || 0;
            } else if (type === 'bin') {
                decimalNum = parseInt(val.replace(/[^01]/g, ''), 2) || 0;
            } else if (type === 'oct') {
                decimalNum = parseInt(val.replace(/[^0-7]/g, ''), 8) || 0;
            }
            setDecVal(decimalNum.toString());
        } catch {
            // Ignore parse errors on typing
        }
    };

    const cssRem = useMemo(() => {
        const px = parseFloat(cssPx);
        const root = parseFloat(cssRoot);
        if (isNaN(px) || isNaN(root) || root <= 0) return '0';
        return parseFloat((px / root).toFixed(4)).toString();
    }, [cssPx, cssRoot]);

    const handleRemChange = (val) => {
        const rem = parseFloat(val);
        const root = parseFloat(cssRoot);
        if (isNaN(rem) || isNaN(root)) return;
        setCssPx((rem * root).toString());
    };

    const convertedTemp = useMemo(() => {
        const val = parseFloat(tempValue);
        if (isNaN(val)) return '0';

        // Convert to Celsius first
        let celsius = val;
        if (tempFrom === 'F') celsius = (val - 32) * (5 / 9);
        if (tempFrom === 'K') celsius = val - 273.15;

        // Convert from Celsius to target
        let result = celsius;
        if (tempTo === 'F') result = (celsius * 9 / 5) + 32;
        if (tempTo === 'K') result = celsius + 273.15;

        return parseFloat(result.toFixed(2)).toString();
    }, [tempValue, tempFrom, tempTo]);

    // Standard Units Calculation
    const convertedUnitValue = useMemo(() => {
        const def = UNIT_DEFINITIONS[category];
        if (!def) return '0';

        const num = parseFloat(fromValue);
        if (isNaN(num)) return '0';

        const uFrom = def.units.find(u => u.id === fromUnit);
        const uTo = def.units.find(u => u.id === toUnit);

        if (!uFrom || !uTo) return '0';

        const baseVal = num * uFrom.ratio;
        const result = baseVal / uTo.ratio;

        return parseFloat(result.toFixed(6)).toString();
    }, [category, fromValue, fromUnit, toUnit]);

    // Quick Multi-Unit Reference for current category
    const quickGrid = useMemo(() => {
        const def = UNIT_DEFINITIONS[category];
        if (!def) return [];

        const num = parseFloat(fromValue);
        if (isNaN(num)) return [];

        const uFrom = def.units.find(u => u.id === fromUnit);
        if (!uFrom) return [];

        const baseVal = num * uFrom.ratio;

        return def.units.map(u => {
            const res = baseVal / u.ratio;
            return {
                id: u.id,
                label: u.label,
                val: parseFloat(res.toFixed(res < 0.001 ? 8 : 4)).toString()
            };
        });
    }, [category, fromValue, fromUnit]);

    const swapUnits = () => {
        if (category === 'temp') {
            const prev = tempFrom;
            setTempFrom(tempTo);
            setTempTo(prev);
        } else {
            const prev = fromUnit;
            setFromUnit(toUnit);
            setToUnit(prev);
        }
    };

    const handleCategoryChange = (newCat) => {
        setCategory(newCat);
        if (newCat === 'length') {
            setFromUnit('m');
            setToUnit('cm');
        } else if (newCat === 'mass') {
            setFromUnit('kg');
            setToUnit('lb');
        } else if (newCat === 'temp') {
            setTempFrom('C');
            setTempTo('F');
        } else if (newCat === 'time') {
            setFromUnit('h');
            setToUnit('min');
        } else if (newCat === 'storage') {
            setFromUnit('GB');
            setToUnit('MB');
        }
    };

    const copyText = useCallback((text, key) => {
        if (!navigator.clipboard) return;
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 1500);
    }, []);

    // Ordered according to user requirement: Basic -> Storage -> Base/Dev -> CSS
    const categories = [
        { id: 'length', label: 'Length' },
        { id: 'mass', label: 'Weight' },
        { id: 'temp', label: 'Temp' },
        { id: 'time', label: 'Time' },
        { id: 'storage', label: 'Storage' },
        { id: 'programmer', label: 'Base / Dev' },
        { id: 'css', label: 'CSS / Rem' },
    ];

    return {
        category,
        categories,
        handleCategoryChange,
        copiedKey,
        copyText,

        // Programmer Base
        baseValues,
        handleBaseChange,

        // CSS Units
        cssPx,
        setCssPx,
        cssRoot,
        setCssRoot,
        cssRem,
        handleRemChange,

        // General Units
        fromValue,
        setFromValue,
        fromUnit,
        setFromUnit,
        toUnit,
        setToUnit,
        convertedUnitValue,
        unitDefinition: UNIT_DEFINITIONS[category],
        quickGrid,
        swapUnits,

        // Temperature
        tempValue,
        setTempValue,
        tempFrom,
        setTempFrom,
        tempTo,
        setTempTo,
        convertedTemp
    };
}
