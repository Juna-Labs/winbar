import { useState } from 'react';
import { Calculator, ArrowLeftRight } from 'lucide-react';
import { useCalculator } from './useCalculator';
import { useConverter } from './useConverter';

export default function useCalcConverter() {
    const [activeTab, setActiveTab] = useState('calculator'); // 'calculator' | 'converter'

    const calculator = useCalculator();
    const converter = useConverter();

    const tabs = [
        { id: 'calculator', label: 'Calculator', icon: Calculator },
        { id: 'converter', label: 'Converter', icon: ArrowLeftRight },
    ];

    return {
        activeTab,
        setActiveTab,
        tabs,
        calculator,
        converter
    };
}
